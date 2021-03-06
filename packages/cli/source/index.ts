import { existsSync, readFileSync } from "fs"
import { load } from "js-yaml"
import { resolve } from "path"
import { argv } from "yargs"
import { blogGenerator, postGenerator } from "./generators"
import { preview } from "./preview"
import { fsPublisher, s3Publisher } from "./publishers"


export {
  blogGenerator,
  fsPublisher,
  postGenerator,
  preview,
  start,
  s3Publisher,
}

const helpText = `
Looks like you could use a little help!
Here are a few commands you can use...
  - \`blog init\`: Generate a blog in this directory
  - \`blog post\`: Generate a post in this blog
  - \`blog preview\`: Run a preview server of your blog
  - \`blog publish\`: Publish your changes!
`

function start(command = argv._[0]) {
  if (command === "init") return blogGenerator()

  const cwd = process.cwd()
  const configPath = resolve(cwd, "blog.config.yml")
  if (!existsSync(configPath)) throw new Error("This is not a blog! Please go to the dir where blog.config.yml exists.")
  const config = load(readFileSync(resolve(configPath), "utf8")) || {}
  const publisher = config.publisher

  if (command === "post") postGenerator()
  else if (command === "preview") preview(cwd)
  else if (command === "publish") {
    if (!argv.s3 && !argv.fs) {
      if (publisher === "s3") s3Publisher(cwd, config)
      if (publisher === "fs") fsPublisher(cwd, config)
    } else {
      if (argv.s3) s3Publisher(cwd, config)
      if (argv.fs) fsPublisher(cwd, config)
    }
  } else console.log(helpText)
}
