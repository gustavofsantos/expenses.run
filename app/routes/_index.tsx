import type {LoaderArgs, V2_MetaFunction} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import {prisma} from "~/db.server";
import {BsArrowLeftCircle, BsArrowRightCircleFill, BsPlus} from "react-icons/bs";

export const meta: V2_MetaFunction = () => {
  return [
    {title: "New Remix App"},
    {name: "description", content: "Welcome to Remix!"},
  ];
};

export async function loader({request}: LoaderArgs) {
  let url = new URL(request.url)
  let orderBy = url.searchParams.get("orderBy") || "date"
  let order = url.searchParams.get("order") || "desc"
  let fromDate = url.searchParams.get("fromDate")
  let toDate = url.searchParams.get("toDate")

  let entries = await prisma.entry.findMany({
    where: {
      date: {
        gte: fromDate ? new Date(fromDate) : undefined,
        lte: toDate ? new Date(toDate) : undefined,
      }
    },
    orderBy: {[orderBy]: order},
    include: {categories: {include: {category: true}}}
  })
  let categories = await prisma.category.findMany({orderBy: {createdAt: "desc"}})

  return {entries, categories}
}

export default function Index() {
  let data = useLoaderData<typeof loader>()
  let formatIntegerToMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(value / 100)
  }

  return (
    <main className="flex flex-col justify-start items-center pt-4">
      <article className="w-full px-2 lg:max-w-lg lg:px-0">
        <h1>Entries</h1>

        <div className="flex space-x-4 items-center py-4">
          <Link to="/entries/new">
            <BsPlus />
            <span>New entry</span>
          </Link>
          <Link to="/categories/new">
            <BsPlus />
            <span>New category</span>
          </Link>
        </div>

        <section className="w-full my-4">
          <form method="get" className="flex flex-col space-y-2">
            <label htmlFor="orderBy">
              <span>Order by</span>
              <select id="orderBy" name="orderBy" defaultValue="date">
                <option value="date">Date</option>
                <option value="value">Value</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label htmlFor="fromDate">
                <span>From</span>
                <input type="date" name="fromDate" id="fromDate" />
              </label>
              <label htmlFor="toDate">
                <span>To</span>
                <input type="date" name="toDate" id="toDate" />
              </label>
            </div>
            <div>
              <button type="submit">Filter</button>
            </div>
          </form>
        </section>

        <hr />

        <section className="w-full my-4">
          <ul>
            {data.entries.map(entry => (
              <li key={entry.id} className="grid grid-cols-[32px_1fr]">
                <div className="flex flex-col pt-2 justify-start items-center w-full">
                  <span className={entry.type === "expense" ? "text-red-500" : "text-green-500"}>
                    {entry.type === "expense" ? (
                      <BsArrowLeftCircle />
                    ) : (
                      <BsArrowRightCircleFill />
                    )
                    }
                  </span>
                </div>
                <div>
                  <p className="font-bold">{formatIntegerToMoney(entry.value)}</p>
                  <p>{entry.description}</p>
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <div>
                    {entry.categories.map(category => (
                      <span className="bg-purple-100 border border-purple-300 text-purple-700 px-1" key={category.categoryId}>{category.category.name}</span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}

