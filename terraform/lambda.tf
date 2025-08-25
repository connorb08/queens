resource "aws_lambda_layer_version" "chromium-layer" {
  s3_bucket = aws_s3_bucket.chromium-layer.bucket
  s3_key    = "chromiumLayers/chromium-v135.0.0-layer.x64.zip"

  layer_name = "chromium_layer"

  compatible_runtimes      = ["nodejs22.x"]
  compatible_architectures = ["x86_64"]
}

resource "aws_lambda_function" "queens" {
  filename      = data.archive_file.queens-src.output_path
  source_code_hash = data.archive_file.queens-src.output_base64sha256
  function_name = "queens"
  role          = aws_iam_role.queens-lambda-execution.arn
  handler       = "index.main"
  runtime       = "nodejs22.x"

  layers = [aws_lambda_layer_version.chromium-layer.arn]

}