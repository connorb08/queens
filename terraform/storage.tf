resource "aws_s3_bucket" "chromium-layer" {
  bucket = "queens-chromium-layer"

  tags = {
    Name        = "Chromium layer bucket"
  }
}