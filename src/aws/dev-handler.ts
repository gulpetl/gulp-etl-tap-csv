import * as handler from './handler';

let event = { resource: '/doparse',
path: '/doparse',
httpMethod: 'POST',
headers: 
{ Accept: '*/*',
'Accept-Encoding': 'gzip, deflate',
'cache-control': 'no-cache',
'CloudFront-Forwarded-Proto': 'https',
'CloudFront-Is-Desktop-Viewer': 'true',
'CloudFront-Is-Mobile-Viewer': 'false',
'CloudFront-Is-SmartTV-Viewer': 'false',
'CloudFront-Is-Tablet-Viewer': 'false',
'CloudFront-Viewer-Country': 'US',
'Content-Type': 'application/json',
Host: '1db06afkad.execute-api.us-west-2.amazonaws.com',
'Postman-Token': 'bac1bff3-5e6a-46cf-9e21-b50b6849e366',
'User-Agent': 'PostmanRuntime/7.6.0',
Via: '1.1 2d920921fd72ecf9e944294f2e48d5d1.cloudfront.net (CloudFront)',
'X-Amz-Cf-Id': 'mc0Tp8ZlKJIZUJpwgeTUxASR3wAZdkhpEvJG44HdZ-vxCTyYGG0LJA==',
'X-Amzn-Trace-Id': 'Root=1-5c4f9bc8-f3a20384bcca31d0afa3deb8',
'X-Forwarded-For': '65.182.85.9, 52.46.30.79',
'X-Forwarded-Port': '443',
'X-Forwarded-Proto': 'https' },
multiValueHeaders: 
{ Accept: [ '*/*' ],
'Accept-Encoding': [ 'gzip, deflate' ],
'cache-control': [ 'no-cache' ],
'CloudFront-Forwarded-Proto': [ 'https' ],
'CloudFront-Is-Desktop-Viewer': [ 'true' ],
'CloudFront-Is-Mobile-Viewer': [ 'false' ],
'CloudFront-Is-SmartTV-Viewer': [ 'false' ],
'CloudFront-Is-Tablet-Viewer': [ 'false' ],
'CloudFront-Viewer-Country': [ 'US' ],
'Content-Type': [ 'application/json' ],
Host: [ '1db06afkad.execute-api.us-west-2.amazonaws.com' ],
'Postman-Token': [ 'bac1bff3-5e6a-46cf-9e21-b50b6849e366' ],
'User-Agent': [ 'PostmanRuntime/7.6.0' ],
Via: 
[ '1.1 2d920921fd72ecf9e944294f2e48d5d1.cloudfront.net (CloudFront)' ],
'X-Amz-Cf-Id': [ 'mc0Tp8ZlKJIZUJpwgeTUxASR3wAZdkhpEvJG44HdZ-vxCTyYGG0LJA==' ],
'X-Amzn-Trace-Id': [ 'Root=1-5c4f9bc8-f3a20384bcca31d0afa3deb8' ],
'X-Forwarded-For': [ '65.182.85.9, 52.46.30.79' ],
'X-Forwarded-Port': [ '443' ],
'X-Forwarded-Proto': [ 'https' ] },
queryStringParameters: null,
multiValueQueryStringParameters: null,
pathParameters: null,
stageVariables: null,
requestContext: 
{ resourceId: '4svrj9',
resourcePath: '/doparse',
httpMethod: 'POST',
extendedRequestId: 'UPVHTEnxvHcF0WA=',
requestTime: '29/Jan/2019:00:18:16 +0000',
path: '/dev/doparse',
accountId: '943224623824',
protocol: 'HTTP/1.1',
stage: 'dev',
domainPrefix: '1db06afkad',
requestTimeEpoch: 1548721096385,
requestId: '5f90ec45-235b-11e9-8317-c9ded4d0564a',
identity: 
{ cognitoIdentityPoolId: null,
accountId: null,
cognitoIdentityId: null,
caller: null,
sourceIp: '65.182.85.9',
accessKey: null,
cognitoAuthenticationType: null,
cognitoAuthenticationProvider: null,
userArn: null,
userAgent: 'PostmanRuntime/7.6.0',
user: null },
domainName: '1db06afkad.execute-api.us-west-2.amazonaws.com',
apiId: '1db06afkad' },
body: '{\n\t"config":{\n\t\t\n\t},\n\t"toParse": "{\\"type\\":\\"STATE\\",\\"value\\":{\\"envelope\\":{\\"to\\":[],\\"cc\\":[],\\"from\\":[],\\"bcc\\":[]},\\"tap_log\\":[{\\"tap_name\\":\\"parseFlat\\",\\"result\\":{\\"linesRead\\":{\\"USDA_Class\\":3}}}],\\"errors\\":[]} }\\r\\n{\\"type\\":\\"RECORD\\",\\"stream\\":\\"Bale\\",\\"record\\":{\\"Gin Code Number\\":60115,\\"Gin Bale Number\\":1119458,\\"Date Classed\\":\\"2015-09-03T00:00:00.000Z\\",\\"Module, Trailer, or Single Bale\\":0,\\"Module\\/Trailer Number\\":\\"00000\\",\\"Bales in Module\\/Trailer\\":0,\\"Official Color Grade\\":42,\\"Fiber Staple Length\\":37,\\"Micronaire\\":36,\\"Strength\\":317,\\"Leaf Grade\\":4,\\"Extraneous Matter\\":0,\\"Remarks\\":0,\\"Instrument ColorCode\\":42,\\"Color Quadrant\\":1,\\"Color Rd\\":733,\\"Color +b\\":91,\\"Non-Lint Content (Trash Percent Area)\\":8,\\"Length Uniformity Index (Percent)\\":820,\\"Upland or Pima\\":1,\\"Record Type\\":0,\\"Record Status\\":0,\\"CCC Loan Premiums and Discounts\\":\\"-0035\\"} }\\r\\n{\\"type\\":\\"RECORD\\",\\"stream\\":\\"Bale\\",\\"record\\":{\\"Gin Code Number\\":60115,\\"Gin Bale Number\\":1119463,\\"Date Classed\\":\\"2015-09-03T00:00:00.000Z\\",\\"Module, Trailer, or Single Bale\\":0,\\"Module\\/Trailer Number\\":\\"00000\\",\\"Bales in Module\\/Trailer\\":0,\\"Official Color Grade\\":42,\\"Fiber Staple Length\\":37,\\"Micronaire\\":34,\\"Strength\\":302,\\"Leaf Grade\\":5,\\"Extraneous Matter\\":0,\\"Remarks\\":0,\\"Instrument ColorCode\\":42,\\"Color Quadrant\\":1,\\"Color Rd\\":725,\\"Color +b\\":92,\\"Non-Lint Content (Trash Percent Area)\\":8,\\"Length Uniformity Index (Percent)\\":809,\\"Upland or Pima\\":1,\\"Record Type\\":0,\\"Record Status\\":0,\\"CCC Loan Premiums and Discounts\\":\\"-0425\\"} }\\r\\n{\\"type\\":\\"RECORD\\",\\"stream\\":\\"Bale\\",\\"record\\":{\\"Gin Code Number\\":60115,\\"Gin Bale Number\\":1119463,\\"Date Classed\\":\\"2015-09-03T00:00:00.000Z\\",\\"Module, Trailer, or Single Bale\\":0,\\"Module\\/Trailer Number\\":\\"00000\\",\\"Bales in Module\\/Trailer\\":0,\\"Official Color Grade\\":42,\\"Fiber Staple Length\\":37,\\"Micronaire\\":34,\\"Strength\\":302,\\"Leaf Grade\\":5,\\"Extraneous Matter\\":0,\\"Remarks\\":0,\\"Instrument ColorCode\\":42,\\"Color Quadrant\\":1,\\"Color Rd\\":725,\\"Color +b\\":92,\\"Non-Lint Content (Trash Percent Area)\\":8,\\"Length Uniformity Index (Percent)\\":809,\\"Upland or Pima\\":1,\\"Record Type\\":0,\\"Record Status\\":0,\\"CCC Loan Premiums and Discounts\\":\\"-0425\\"} }\\r\\n{\\"type\\":\\"RECORD\\",\\"stream\\":\\"Bale\\",\\"record\\":{\\"Gin Code Number\\":60115,\\"Gin Bale Number\\":1119463,\\"Date Classed\\":\\"2015-09-03T00:00:00.000Z\\",\\"Module, Trailer, or Single Bale\\":0,\\"Module\\/Trailer Number\\":\\"00000\\",\\"Bales in Module\\/Trailer\\":0,\\"Official Color Grade\\":42,\\"Fiber Staple Length\\":37,\\"Micronaire\\":34,\\"Strength\\":302,\\"Leaf Grade\\":5,\\"Extraneous Matter\\":0,\\"Remarks\\":0,\\"Instrument ColorCode\\":42,\\"Color Quadrant\\":1,\\"Color Rd\\":725,\\"Color +b\\":92,\\"Non-Lint Content (Trash Percent Area)\\":8,\\"Length Uniformity Index (Percent)\\":809,\\"Upland or Pima\\":1,\\"Record Type\\":0,\\"Record Status\\":0,\\"CCC Loan Premiums and Discounts\\":\\"-0425\\"} }\\r\\n{\\"type\\":\\"STATE\\",\\"value\\":{\\"envelope\\":{\\"to\\":[],\\"cc\\":[],\\"from\\":[],\\"bcc\\":[]},\\"tap_log\\":[{\\"tap_name\\":\\"parseFlat\\",\\"result\\":{\\"linesRead\\":{\\"USDA_Class\\":3}}}],\\"errors\\":[]} }"\n}',
isBase64Encoded: false }


handler.doParse(event,null,()=>{});
