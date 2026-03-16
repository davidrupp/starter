# Rails VPC Architecture with CDK

This project sets up the VPC architecture for deploying a Rails application in a private subnet with public access through CloudFront.

## Architecture Overview

The VPC architecture includes:

1. **VPC**: A virtual private cloud with CIDR block 10.0.0.0/16
2. **Public Subnet**: For load balancers and other public-facing components
3. **Private Subnet**: For EC2 instances running the Rails application
4. **NAT Gateway**: Enables private subnet instances to access the internet for updates
5. **Security Groups**: Properly configured for secure communication

## Components

- **VPC**: With public and private subnets
- **Internet Gateway**: For public subnet internet access
- **NAT Gateway**: For private subnet internet access
- **Security Groups**:
  - EC2 Security Group: For Rails application instances
  - Load Balancer Security Group: For public access
  - Database Security Group: For database access

## Deployment

To deploy this VPC architecture:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Deploy the stack:
   ```bash
   npx cdk deploy
   ```

## Outputs

After deployment, the CDK will output:
- VPC ID
- Public Subnet IDs
- Private Subnet IDs
- Security Group IDs

These outputs can be used in subsequent deployments of your Rails application.

## Security

- EC2 instances in private subnet can only be accessed through the load balancer
- Database access is restricted to the private subnet
- All outbound traffic is allowed from EC2 instances
- Internet access for private subnet is only possible through NAT Gateway