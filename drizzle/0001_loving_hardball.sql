CREATE TABLE `diplomas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`certificateNumber` varchar(32) NOT NULL,
	`avgScore` int NOT NULL,
	`totalXP` int NOT NULL,
	`levelNumber` int NOT NULL,
	`diplomaUrl` text,
	`fileKey` varchar(512),
	`issuedAt` bigint NOT NULL,
	`expiresAt` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diplomas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`progressData` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_progress_id` PRIMARY KEY(`id`)
);
