import type {LoaderArgs, V2_MetaFunction} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import {prisma} from "~/db.server";
import {BsArrowLeftCircle, BsArrowRightCircleFill, BsPlus} from "react-icons/bs";
import {format} from "date-fns"

export const meta: V2_MetaFunction = () => {
  return [
    {title: "Expenses"},
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
  let totalExpenses = entries.filter(entry => entry.type === "expense").reduce((acc, entry) => acc + entry.value, 0)
  let totalIncomes = entries.filter(entry => entry.type === "income").reduce((acc, entry) => acc + entry.value, 0)
  let balance = totalIncomes - totalExpenses

  return {entries, categories, totalExpenses, totalIncomes, balance, filter: {orderBy, order, fromDate, toDate}}
}

export default function Index() {
  let data = useLoaderData<typeof loader>()
  let formatIntegerToMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(value / 100)
  }

  return (
    <main>
      <article>
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
          <form method="get">
            <label htmlFor="orderBy">
              <span>Order by</span>
              <select id="orderBy" name="orderBy" defaultValue={data.filter.orderBy ?? "date"}>
                <option value="date">Date</option>
                <option value="value">Value</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label htmlFor="fromDate">
                <span>From</span>
                <input type="date" name="fromDate" id="fromDate" defaultValue={data.filter.fromDate ?? undefined} />
              </label>
              <label htmlFor="toDate">
                <span>To</span>
                <input type="date" name="toDate" id="toDate" defaultValue={data.filter.toDate ?? undefined} />
              </label>
            </div>
            <div className="flex space-x-2">
              <button type="submit">Filter</button>
              <button type="reset">Reset</button>
            </div>
          </form>
        </section>

        <hr />

        <section className="w-full my-4 ">
          <details>
            <summary>Stats</summary>
            <div className="grid grid-cols-3 gap-2 w-full">
              <div>
                <h2>Expenses</h2>
                <p>{formatIntegerToMoney(data.totalExpenses)}</p>
              </div>
              <div>
                <h2>Incomes</h2>
                <p>{formatIntegerToMoney(data.totalIncomes)}</p>
              </div>
              <div>
                <h2>Balance</h2>
                <p>{formatIntegerToMoney(data.balance)}</p>
              </div>
            </div>
          </details>
        </section>

        <section className="w-full my-4">
          <ul className="divide-y divide-gray-300">
            {data.entries.map(entry => (
              <li key={entry.id} className="grid grid-cols-[32px_1fr] py-2">
                <div className="flex flex-col pt-2 justify-start items-center w-full">
                  <span className={`${entry.type === "expense" ? "text-red-600" : "text-green-700"} text-lg`}>
                    {entry.type === "expense" ? (
                      <BsArrowLeftCircle />
                    ) : (
                      <BsArrowRightCircleFill />
                    )
                    }
                  </span>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{formatIntegerToMoney(entry.value)}</span>
                    <Link to={`/entries/${entry.id}`}>Edit</Link>
                  </div>
                  <span>{format(new Date(entry.date), "dd/MM/yyyy")}</span>
                  <p>{entry.description}</p>
                  <div className="flex space-x-1">
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

