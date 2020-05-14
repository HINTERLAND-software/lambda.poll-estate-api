# lambda.poll-estate-api

## Tasks

1. Poll estates from portal ([estate-portal-aggregator](https://github.com/jroehl/estate-portal-aggregator))
   - Filter estates from portal ([JSONPATH](https://goessner.net/articles/JsonPath/))

2. Poll estates from Contentful by `contentTypeId` with fields `sys.id`, `sys.updatedAt`
   - Filter estates from Contentful ([JSONPATH](https://goessner.net/articles/JsonPath/))

3. Compare estates by `internalID` (portal) / `sys.id` (Contentful) and `updatedAt` (portal) / `sys.updatedAt` (Contentful)

   1. Loop portal estates
      1. If `internalID` not in Contentful (`sys.id`)
         - Add portal estate to webhook payload - array property `created`

      2. Else if `updatedAt` > `sys.updatedAt`
         - Add portal estate to webhook payload - array property `updated`

   2. Loop Contentful estates
      1. If `sys.id` not in portal (`internalID`)
         - Add estate `sys.id` to webhook payload - array property `deleted`

4. If `created` / `updated` / `deleted` length >= 1
   - POST webhook with payload

## TODO

- [ ] CiCd
- [ ] Tests
- [x] Scheduling
- [ ] development / production deploys