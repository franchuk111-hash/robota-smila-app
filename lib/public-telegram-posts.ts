import destinations from "../config/telegram-destinations.json";
import ledger from "../data/telegram-mirror-posts.json";

type Receipt = {
  vacancyId: number; chatId: number; sourceChatId: number;
  status: string; messageId?: number;
};

// Only public vacancy and channel message IDs may enter the browser bundle.
export function publicTelegramPosts(posts: Record<string, Receipt> = ledger.posts): Record<number, number> {
  const channel = destinations.mirrors.find(target => target.username === "robota_smila");
  const published: Record<number, number> = {};
  for (const [key, post] of Object.entries(posts)) {
    if (post.chatId === channel?.chatId && post.sourceChatId === destinations.primary.chatId &&
        key === `${post.vacancyId}:${post.chatId}` && post.status === "published" &&
        post.messageId && Number.isSafeInteger(post.messageId) && post.messageId > 0) {
      published[post.vacancyId] = post.messageId;
    }
  }
  return published;
}
