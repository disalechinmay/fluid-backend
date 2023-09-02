-- CreateTable
CREATE TABLE "fl_user" (
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "chats" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "fl_user_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "plt_chat" (
    "uid" BIGSERIAL NOT NULL,
    "participants" TEXT[],

    CONSTRAINT "plt_chat_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "plt_message" (
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plt_message_pkey" PRIMARY KEY ("chatId","senderId","date")
);

-- CreateIndex
CREATE UNIQUE INDEX "fl_user_email_key" ON "fl_user"("email");
