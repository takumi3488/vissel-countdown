import { AnyNode, Cheerio, load } from "cheerio"

type TeamData = { point: number; gameCount: number }
function extractDataFromRow(row: Cheerio<AnyNode>): TeamData {
  const point = +row.find("td:nth-child(4)").text()
  const gameCount = +row.find("td:nth-child(5)").text()
  return {
    point,
    gameCount
  }
}

export default async function Home() {
  const GAME_COUNT = 34
  const res = await fetch("https://www.jleague.jp/standings/j1/", {
    next: {
      revalidate: 60
    }
  })
  const text = await res.text()
  const $ = load(text)
  const rows = $(".scoreTable01.J1table>tbody>tr")
  const kobeRow = rows.has("span.embKobe")
  const { point: kobePoint, gameCount: kobeGameCount } = extractDataFromRow(kobeRow)
  const teamsData: TeamData[] = []
  rows.not(kobeRow).each((_, row) => {
    teamsData.push(extractDataFromRow($(row)))
  })
  const maxPoint = Math.max(...teamsData.map(({ point, gameCount }) => point + 3 * (GAME_COUNT - gameCount)))
  const rest = Math.ceil((maxPoint - kobePoint) / 3)
  return (
    <main className="p-20">
      <p className="text-2xl text-indigo-500 font-bold text-center ">ヴィッセル神戸優勝まであと</p>
      <div className="absolute inset-0 flex flex-col items-center justify-center py-12">
        <div className="animate-bounce">
          <h1 className="background-animate font-extrabold text-8xl bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 text-transparent text-center p-5 mb-4 leading-none text-gray-900">
            {rest}<span className="text-2xl">勝</span>
          </h1>
        </div>
      </div>
    </main>
  )
}
