1. terraform init
2. After terraform apply, go to AWS ACM console.
3. get the created certificate DNS validation TXT record from the output and add to the DNS provider
4. Wait until ACM cert status shows ISSUED.
5. switch manual_step to true
6. RE run the apply
7. Add a CNAME in GoDaddy:
	- Name: your subdomain
	- Value: your CloudFront domain (e.g., d1234abcd.cloudfront.net)
8. Add secrets in Github for Action (settings -> secrets and variables -> action):
	- AWS_ACCESS_KEY_ID
	- AWS_REGION
	- AWS_SECRET_ACCESS_KEY
	- CLOUDFRONT_DISTRIBUTION_ID
	- S3_BUCKET_NAME