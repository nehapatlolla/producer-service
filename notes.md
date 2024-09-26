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

## creation

Producer

1. Check whether the user exists previously- if exists say user already exists
2. check whether all the deatils which are used to create the user are provided- if not say provide the proper details
3. user creation req message should be sent to queue- create req
4. After the user is created consumer should return the message that it is created in db to the producer - user created in db

Consumer

1. poll the create message from the queue
2. create the user in dynamodb
3. Send the message to the producer that user is created

## updation

Producer

1. Check whether the user exist
2. check whether the user is blocked before
3. send the updation req to the sqs queue
4. after the user is updated recieve the reponse from the consumer

## Testing
