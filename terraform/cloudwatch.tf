resource "aws_cloudwatch_event_rule" "queens-cron" {
  name                = "queens-cron"
  description         = "Triggers queens-cron daily at 10am est"
  schedule_expression = "cron(0 10 * * ? *)"
}

resource "aws_cloudwatch_event_target" "queens-target" {
  rule      = aws_cloudwatch_event_rule.queens-cron.name
  target_id = "queens-target"
  arn       = aws_lambda_function.queens.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_invoke_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.queens.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.queens-cron.arn
}
