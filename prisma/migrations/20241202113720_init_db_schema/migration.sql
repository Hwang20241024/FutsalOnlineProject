-- CreateTable
CREATE TABLE `USERS` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `cash` VARCHAR(191) NOT NULL,
    `mmr` INTEGER NOT NULL,

    UNIQUE INDEX `USERS_id_key`(`id`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MATCHRESULTS` (
    `MATCHID` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `result` TEXT NOT NULL,
    `enemy` JSON NOT NULL,

    PRIMARY KEY (`MATCHID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TEAM` (
    `teamId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `forward` VARCHAR(191) NOT NULL,
    `midfielder` VARCHAR(191) NOT NULL,
    `defender` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`teamId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `INVENTORY` (
    `inventoryId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `cardId` INTEGER NOT NULL,
    `upgrade` INTEGER NOT NULL,
    `playing` INTEGER NOT NULL,

    PRIMARY KEY (`inventoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CARDS` (
    `cardId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `stat` JSON NOT NULL,
    `grade` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cardId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MATCHRESULTS` ADD CONSTRAINT `MATCHRESULTS_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `USERS`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TEAM` ADD CONSTRAINT `TEAM_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `USERS`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `INVENTORY` ADD CONSTRAINT `INVENTORY_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `CARDS`(`cardId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `INVENTORY` ADD CONSTRAINT `INVENTORY_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `USERS`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
