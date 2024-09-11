yarn add @nestjs/typeorm typeorm pg aws-sdk @nestjs/swagger swagger-ui-express

nest g resource user

yarn add class-validator class-transformer

yarn add @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

yarn add @aws-sdk/client-sqs

To cretate the GSI

aws dynamodb update-table \
 --table-name Users \
 --attribute-definitions \
 AttributeName=email,AttributeType=S \
 AttributeName=dob,AttributeType=S \
 --global-secondary-index-updates \
 '[{
"Create": {
"IndexName": "EmailDOBIndex",
"KeySchema": [
{ "AttributeName": "email", "KeyType": "HASH" },
{ "AttributeName": "dob", "KeyType": "RANGE" }
],
"Projection": {
"ProjectionType": "ALL"
},
"ProvisionedThroughput": {
"ReadCapacityUnits": 5,
"WriteCapacityUnits": 5
}
}
}]'
