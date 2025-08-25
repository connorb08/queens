data "archive_file" "queens-src" {
  type        = "zip"
  source_file = "${path.module}/../dist/index.js"
  output_path = "${path.module}/../dist/function.zip"
}
