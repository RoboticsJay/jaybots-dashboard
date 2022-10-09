package com.acmerobotics.dashboard.path;

import com.acmerobotics.dashboard.message.redux.UploadPath;
import com.acmerobotics.dashboard.path.trajectorysequence.TrajectorySequence;
import com.acmerobotics.dashboard.path.trajectorysequence.TrajectorySequenceBuilder;
import com.acmerobotics.roadrunner.geometry.Pose2d;
import com.acmerobotics.roadrunner.geometry.Vector2d;
import com.acmerobotics.roadrunner.trajectory.constraints.*;

import java.util.Arrays;

public class MakeTrajectory {
    MakeTrajectory() {}
    public static TrajectorySequence fromUploadedPath(UploadPath dashboardPath){
        double MAX_VEL = 68.0;
        double MAX_ACCEL = 90.0;
        double MAX_ANG_VEL = Math.toRadians(3.0);
        double MAX_ANG_ACCEL = Math.toRadians(6.28);
        double TRACK_WIDTH = 11.04; // in

        TrajectoryVelocityConstraint VEL_CONSTRAINT = new MinVelocityConstraint(Arrays.asList(
                new AngularVelocityConstraint(MAX_ANG_VEL),
                new MecanumVelocityConstraint(MAX_VEL, TRACK_WIDTH)
        ));
        TrajectoryAccelerationConstraint ACCEL_CONSTRAINT = new ProfileAccelerationConstraint(MAX_ACCEL);

        TrajectorySequenceBuilder builder = new TrajectorySequenceBuilder(
                new Pose2d(dashboardPath.start.x, dashboardPath.start.y, dashboardPath.start.heading),
                dashboardPath.start.tangent,
                VEL_CONSTRAINT, ACCEL_CONSTRAINT,
                MAX_ANG_VEL, MAX_ANG_ACCEL
        );
//    drive.poseEstimate = Pose2d(dashboardPath.start.x, dashboardPath.start.y, dashboardPath.start.heading)

        for (PathSegment s : dashboardPath.segments) {
            switch (s.type) {
                case WAIT: builder.waitSeconds(s.time);
                case LINE: switch (s.headingType) {
                    case TANGENT: builder.lineTo(new Vector2d(s.x, s.y));
                    case CONSTANT: builder.lineToConstantHeading(new Vector2d(s.x, s.y));
                    case LINEAR: builder.lineToLinearHeading(new Pose2d(s.x, s.y, s.heading));
                    case SPLINE: builder.lineToSplineHeading(new Pose2d(s.x, s.y, s.heading));
//                    default: error("Unknown HeadingType ${s.headingType}");
                }
                case SPLINE: switch (s.headingType) {
                    case TANGENT: builder.splineTo(new Vector2d(s.x, s.y), s.tangent);
                    case CONSTANT: builder.splineToConstantHeading(new Vector2d(s.x, s.y), s.tangent);
                    case LINEAR: builder.splineToLinearHeading(new Pose2d(s.x, s.y, s.heading), s.tangent);
                    case SPLINE: builder.splineToSplineHeading(new Pose2d(s.x, s.y, s.heading), s.tangent);
//                    default: error("Unknown HeadingType ${s.headingType}")
                }
//                default: error("Unknown SegmentType ${s.type}");
            }
        }

        return builder.build();
    }
}