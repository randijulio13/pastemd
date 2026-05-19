-- CreateTable
CREATE TABLE `Paste` (
    `id` VARCHAR(8) NOT NULL,
    `content` TEXT NOT NULL,
    `passwordHash` VARCHAR(256) NULL,
    `passwordSalt` VARCHAR(128) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isPasswordProtected` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Paste_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
