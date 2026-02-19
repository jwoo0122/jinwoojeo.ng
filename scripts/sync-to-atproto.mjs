import { AtpAgent } from '@atproto/api'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'
import { TID } from '@atproto/common'
import process from 'process'

const agent = new AtpAgent({ service: 'https://pds.jinwoojeo.ng' })

await agent.login({
  identifier: 'jinwoojeo.ng',
  password: process.env.PDS_PASSWORD
})

const existing = await agent.api.com.atproto.repo.listRecords({
  repo: agent.session.did,
  collection: 'app.bsky.feed.post',
  limit: 100
})

const existingMap = {}
for (const record of existing.data.records) {
  const embedUri = record.value.embed?.external?.uri
  if (embedUri) {
    const slug = embedUri.split('/').pop()
    existingMap[slug] = record.uri.split('/').pop()
  }
}

const blogDir = join(process.cwd(), 'src/content/blog')
const files = await readdir(blogDir)

for (const file of files) {
  const raw = await readFile(join(blogDir, file), 'utf-8')
  const { data } = matter(raw)

  const slug = file.replace('.mdx', '')
  const url = `https://leo.works/${slug}`

  const record = {
    $type: 'app.bsky.feed.post',
    text: `${data.title}\n${data.description}`,
    createdAt: new Date(data.pubDate).toISOString(),
    embed: {
      $type: 'app.bsky.embed.external',
      external: {
        uri: url,
        title: data.title,
        description: data.description ?? ''
      }
    }
  }

  if (existingMap[slug]) {
    // 이미 있으면 put
    await agent.api.com.atproto.repo.putRecord({
      repo: agent.session.did,
      collection: 'app.bsky.feed.post',
      rkey: existingMap[slug],
      record
    })
    console.log(`✓ updated ${data.title}`)
  } else {
    // 없으면 create
    await agent.api.com.atproto.repo.createRecord({
      repo: agent.session.did,
      collection: 'app.bsky.feed.post',
      rkey: TID.nextStr(),
      record
    })
    console.log(`✓ created ${data.title}`)
  }
}
