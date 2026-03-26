import "dotenv/config";

export const config = {
  wp: {
    apiUrl: process.env.WP_API_URL || "https://www.mydriverparis.com/wp-json",
    apiKey: process.env.WP_API_KEY || "",
  },
  zeplan: {
    apiUrl:
      process.env.ZEPLAN_API_URL || "https://app.zeplan.ai/api/v1/public",
    apiKey: process.env.ZEPLAN_API_KEY || "",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  webhookPort: parseInt(process.env.WEBHOOK_PORT || "3100", 10),
};
