-- CreateTable
CREATE TABLE "fl_user" (
    "uid" STRING NOT NULL,
    "email" STRING NOT NULL,
    "pictureUrl" STRING NOT NULL DEFAULT '',
    "chats" INT8[] DEFAULT ARRAY[]::INT8[],

    CONSTRAINT "fl_user_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "plt_chat" (
    "uid" INT8 NOT NULL DEFAULT unique_rowid(),
    "participants" STRING[],

    CONSTRAINT "plt_chat_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "plt_message" (
    "chatId" STRING NOT NULL,
    "senderId" STRING NOT NULL,
    "text" STRING NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plt_message_pkey" PRIMARY KEY ("chatId","senderId","date")
);

-- CreateIndex
CREATE UNIQUE INDEX "fl_user_email_key" ON "fl_user"("email");
