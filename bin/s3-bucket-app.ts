#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { S3BucketStack } from '../lib/s3-bucket-stack';

const app = new cdk.App();
new S3BucketStack(app, 'S3BucketStack');
