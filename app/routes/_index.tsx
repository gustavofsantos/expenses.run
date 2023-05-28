import type {LoaderArgs, V2_MetaFunction} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import {prisma} from "~/db.server";
import {BsArrowLeftCircle, BsArrowRightCircleFill} from "react-icons/bs";

export const meta: V2_MetaFunction = () => {
  return [
    {title: "New Remix App"},
    {name: "description", content: "Welcome to Remix!"},
  ];
};

export async function loader(args: LoaderArgs) {
  let entries = await prisma.entry.findMany({orderBy: {date: "desc"}, include: {categories: {include: {category: true}}}})
  let categories = await prisma.category.findMany({orderBy: {createdAt: "desc"}})

  return {entries, categories}
}

export default function Index() {
  let data = useLoaderData<typeof loader>()
  let formatIntegerToMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(value / 100)
  }

  return (
    <main>
      <h1>Entries</h1>

      <Link to="/entries/new">New entry</Link>
      <Link to="/categories/new">New category</Link>

      <section>
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
    </main>
  );
}

