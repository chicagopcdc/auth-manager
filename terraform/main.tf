locals {  
 # S3 variables
  bucket_name                 = "${var.app_name}-${var.env_name}-bucket"

  # ACM
  domain_url                  = "${var.app_name}${var.env_name != "prod" ? "-${var.env_name}" : ""}.${var.base_domain_url}"

  # IAM
  github_user                 = "${var.app_name}-${var.env_name}-github-actions-deployer"
  github_user_policy          = "${var.app_name}-${var.env_name}-github-actions-deployer-policy"
}

data "aws_caller_identity" "current" {}



module "s3_website" {
  source                      = "git::ssh://git@github.com/chicagopcdc/terraform_modules.git//aws/s3?ref=0.6.0"
  
  bucket_name                 = "${local.bucket_name}"
  force_delete                = var.s3_force_delete
  enable_lifecycle            = false
  versioning                  = "Disabled"
  enable_website_hosting      = true
  encryption                  = false
}

/*
resource "aws_s3_bucket_policy" "website_policy" {
  bucket = module.s3_website.bucket_id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = ["${module.s3_website.bucket_arn}/*"]
      }
    ]
  })
}
*/
resource "aws_s3_bucket_policy" "website_policy" {
  count  = var.manual_step ? 1 : 0
  bucket = module.s3_website.bucket_id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontOnly",
        Effect    = "Allow",
        Principal = {
          AWS = module.cloudfront[0].cloudfront_oai_arn
        },
        Action   = "s3:GetObject",
        Resource = "${module.s3_website.bucket_arn}/*"
      }
    ]
  })
}


module "acm_cert" {
  source                    = "git::ssh://git@github.com/chicagopcdc/terraform_modules.git//aws/acm?ref=0.6.0"
  
  domain_url                = "${local.domain_url}"
  tags = var.default_tags

  providers = {
    aws = aws.use1
  }
}



resource "aws_wafv2_ip_set" "allowed_ips" {
  name               = "${var.app_name}-${var.env_name}-allowed-ips"
  scope              = "CLOUDFRONT"
  ip_address_version = "IPV4"

  addresses = ["205.208.0.0/17", "128.135.0.0/16", "165.68.0.0/16"]
}
resource "aws_wafv2_web_acl" "restrict_ips" {
  name  = "${var.app_name}-${var.env_name}-acl"
  scope = "CLOUDFRONT"

  default_action {
    block {}
  }

  rule {
    name     = "AllowSpecificIPs"
    priority = 1

    action {
      allow {}
    }

    statement {
      ip_set_reference_statement {
        arn = aws_wafv2_ip_set.allowed_ips.arn
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "allowSpecificIPs"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "restrictIps"
    sampled_requests_enabled   = true
  }
}

module "cloudfront" {
  source                          = "git::ssh://git@github.com/chicagopcdc/terraform_modules.git//aws/cloudfront?ref=dev"
  
  domain_alias                    = "${local.domain_url}"
  bucket_regional_domain_name     = module.s3_website.bucket_regional_domain_name
  cert_arn                        = module.acm_cert.acm_cert_arn

  web_acl_id                      = aws_wafv2_web_acl.restrict_ips.arn

  count                           = var.manual_step ? 1 : 0
}

resource "aws_iam_user" "github_actions" {
  name = local.github_user
  
  count                           = var.manual_step ? 1 : 0
}
resource "aws_iam_access_key" "github_actions_key" {
  user = aws_iam_user.github_actions[0].name

  count                           = var.manual_step ? 1 : 0
}
resource "aws_iam_policy" "github_actions_policy" {
  name        = local.github_user_policy
  description = "Permissions for GitHub Actions to deploy to S3 and invalidate CloudFront"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        Resource = [
          "${module.s3_website.bucket_arn}",
          "${module.s3_website.bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = "cloudfront:CreateInvalidation",
        Resource = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${module.cloudfront[0].cloudfront_distribution_id}"
      }
    ]
  })

  count                           = var.manual_step ? 1 : 0
}
resource "aws_iam_user_policy_attachment" "github_actions_attach" {
  user       = aws_iam_user.github_actions[0].name
  policy_arn = aws_iam_policy.github_actions_policy[0].arn

  count                           = var.manual_step ? 1 : 0
}



