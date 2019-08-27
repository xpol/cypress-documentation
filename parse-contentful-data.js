/* eslint-disable no-console */
const Contentful = require('contentful')
const moment = require('moment')
const yaml = require('js-yaml')
const fs = require('fs')
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer')

const ContentfulContentType = 'topBanner'

const getContentfulInfo = async () => new Promise((resolve, reject) => {
  // configure Contentful request
  const space = process.env.GATSBY_CONTENTFUL_SPACE_ID
  const accessToken = process.env.GATSBY_CONTENTFUL_ACCESS_TOKEN
  const environment = process.env.GATSBY_CONTENTFUL_ENVIRONMENT || 'master'

  // if no Contentful space variables - resolve this script wit success code & no updates
  if (typeof space === 'undefined' || typeof accessToken === 'undefined') {
    return resolve({ message: 'No Contentful space variables.' })
  }

  return Contentful.createClient({ space, accessToken, environment })
  .getEntries({ content_type: ContentfulContentType })
  .then(({ items }) => {
    // get all our banners data
    const data = items.reduce((filtered, { fields }) => {
      if (moment(fields.endDate).isSameOrAfter(moment())) {
        filtered.push({ ...fields, text: documentToHtmlString(fields.text) })
      }

      return filtered
    }, [])

    // and write it into file
    fs.writeFile(
      `${__dirname}/source/_data/banners.yml`,
      yaml.safeDump(data),
      (error) => {
        if (error) return reject(error)

        return resolve({ message: 'Get Contentful data successful' })
      },
    )
  })
  .catch((err) => reject(err))
})

const parseContentfulData = () => getContentfulInfo()
.then((r) => {
  console.log(r)

  return null
})
.catch((e) => {
  console.error(new Error(e.message || 'Something went wrong'))
  process.exit(1)

  return null
})

// // allow using module.parent
// // @ts-ignore
// if (!module.parent) {
//   parseContentfulData()
// } else {
//   module.exports = {
//     parseContentfulData,
//   }
// }
parseContentfulData()
