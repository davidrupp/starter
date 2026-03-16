# CDK App for Rails VPC Architecture

import * as cdk from 'aws-cdk-lib';
import { RailsVpcStack } from './lib/rails_vpc_stack';

const app = new cdk.App();
new RailsVpcStack(app, 'RailsVpcStack');

app.synth();