#!/bin/bash

curl --location --request POST 'https://sls-code-test.us.auth0.com/oauth/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=wxsWtQuMwbr85MwKLet8Hs3HspY04N4F' \
--data-urlencode 'username=jcq012@gmail.com' \
--data-urlencode 'password=KEEPcode012' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'scope=openid'
