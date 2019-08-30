import Taro, { Component, Config } from "@tarojs/taro"
import { View, Text } from "@tarojs/components"
import "./index.scss"
import { mdLink, isGitHubPage } from "@/utils/repo"

const faceLink = (f: string) => {
  return (
    "![](https://www.webfx.com/tools/emoji-cheat-sheet/graphics/emojis/" +
    f +
    ".png)"
  )
}

const getFixedMD = (rawMD = "") => {
  let md = rawMD

  const d = {
    "’": "'",
    "<br>": "\n\n",
    "<br/>": "\n\n",
    "<br />": "\n\n",
    "<em>": "",
    "</em>": "",
    "<strong>": "",
    "</strong>": "",
    "<li>": "* ",
    "</li>": "\n",
    "<ul>": "\n",
    "</ul>": "\n",
    "<code>": "`",
    "</code>": "`",
    "&nbsp;": " ",
    "&quot;": '"',
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&gt;": ">",
    "&lt;": "<"
  }
  for (const k in d) {
    const reg = new RegExp(k, "g")
    md = md.replace(reg, d[k])
  }

  const faceRegExp = [/:([a-z_]{1,30}?):/g, /[+*-] (\[[x ]\])/g]
  faceRegExp.map(f => {
    const tmpreg = md
    while ((match = f.exec(tmpreg))) {
      if (match[1].startsWith("[")) {
        match[0] = match[1]
        if (match[1].indexOf("x") > 0) {
          match[1] = "white_check_mark"
        } else {
          match[1] = "white_medium_square"
        }
      }
      md = md.replace(match[0], faceLink(match[1]))
    }
  })

  const linkRegExp = /((^|[ \n:\uff1a\uff0c]+)(https?:\/\/[/0-9a-zA-Z.&=#_?-]+)([ \t\r\n]+|$))/g
  const matchCnt = 3
  let match: any
  const newHtml = md
  while ((match = linkRegExp.exec(newHtml))) {
    if (match[1] && match[matchCnt]) {
      const t = match[1]
      const url = match[matchCnt]
      const r = t.replace(url, mdLink(url, url))
      md = md.replace(match[1], r)
    }
  }
  return md
}

interface MarkDownProps {
  md: string | undefined | null
  full_name?: string
}

const Markdown = ({ md: rawMD, full_name }: MarkDownProps) => {
  if (!rawMD) {
    return null
  }

  const md = getFixedMD(rawMD)

  const handleClick = e => {
    let clickurl = e.detail.currentTarget.dataset.text
    const isGitHubUrl = isGitHubPage(clickurl)
    // TODO redirect other mini program
    // TODO  open file
    if (isGitHubUrl) {
      // TODO
    } else {
      Taro.setClipboardData({
        data: `${clickurl}`,
        // @ts-ignore
        success: function(res) {
          Taro.showToast({
            title: `Copy Success`,
            icon: "success"
          })
        }
      })
    }
  }

  const baseUrl = full_name
    ? "https://raw.githubusercontent.com/" + full_name + "/master/"
    : ""

  return (
    <View>
      <wemark
        onClick={handleClick}
        md={md}
        link
        highlight
        type="wemark"
        baseurl={baseUrl}
      />
    </View>
  )
}

Markdown.config = {
  usingComponents: {
    wemark: "../../wemark/wemark"
  }
}

export default Markdown