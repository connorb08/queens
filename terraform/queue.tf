resource "cloudflare_queue" "queens-queue" {
  account_id = var.cloudflare-account-id
  queue_name = var.queue-name
}
