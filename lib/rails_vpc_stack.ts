# CDK VPC Architecture for Rails Application Deployment

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class RailsVpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, 'RailsAppVpc', {
      cidr: '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        }
      ],
      natGateways: 1,
    });

    // Create Security Groups
    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'Ec2SecurityGroup', {
      vpc: vpc,
      securityGroupName: 'rails-app-ec2-private-sg',
      description: 'Security group for EC2 instances in private subnet',
    });

    // Allow inbound traffic from load balancer (if using ALB)
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.ipv4('10.0.1.0/24'),  // Allow from public subnet
      ec2.Port.tcp(80),
      'Allow HTTP from public subnet'
    );

    ec2SecurityGroup.addIngressRule(
      ec2.Peer.ipv4('10.0.1.0/24'),  // Allow from public subnet
      ec2.Port.tcp(443),
      'Allow HTTPS from public subnet'
    );

    // Allow all outbound traffic
    ec2SecurityGroup.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTcp(),
      'Allow all outbound traffic'
    );

    const loadBalancerSecurityGroup = new ec2.SecurityGroup(this, 'LoadBalancerSecurityGroup', {
      vpc: vpc,
      securityGroupName: 'rails-app-load-balancer-sg',
      description: 'Security group for load balancer',
    });

    // Allow HTTP from anywhere
    loadBalancerSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from anywhere'
    );

    // Allow HTTPS from anywhere
    loadBalancerSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from anywhere'
    );

    // Allow all outbound traffic
    loadBalancerSecurityGroup.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTcp(),
      'Allow all outbound traffic'
    );

    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: vpc,
      securityGroupName: 'rails-app-database-sg',
      description: 'Security group for database',
    });

    // Allow access from EC2 instances in private subnet
    databaseSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('10.0.2.0/24'),  // Private subnet
      ec2.Port.tcp(5432),  // PostgreSQL default port
      'Allow PostgreSQL from private subnet'
    );

    // Allow all outbound traffic
    databaseSecurityGroup.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTcp(),
      'Allow all outbound traffic'
    );

    // Output VPC ID
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'The ID of the VPC',
    });

    // Output Public Subnet IDs
    new cdk.CfnOutput(this, 'PublicSubnetIds', {
      value: vpc.publicSubnets.map(subnet => subnet.subnetId).join(','),
      description: 'The IDs of the public subnets',
    });

    // Output Private Subnet IDs
    new cdk.CfnOutput(this, 'PrivateSubnetIds', {
      value: vpc.privateSubnets.map(subnet => subnet.subnetId).join(','),
      description: 'The IDs of the private subnets',
    });

    // Output Security Group IDs
    new cdk.CfnOutput(this, 'Ec2SecurityGroupId', {
      value: ec2SecurityGroup.securityGroupId,
      description: 'The ID of the EC2 security group',
    });

    new cdk.CfnOutput(this, 'LoadBalancerSecurityGroupId', {
      value: loadBalancerSecurityGroup.securityGroupId,
      description: 'The ID of the load balancer security group',
    });

    new cdk.CfnOutput(this, 'DatabaseSecurityGroupId', {
      value: databaseSecurityGroup.securityGroupId,
      description: 'The ID of the database security group',
    });
  }
}