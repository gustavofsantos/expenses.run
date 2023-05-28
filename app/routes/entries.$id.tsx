import {ActionArgs, LoaderArgs, redirect} from "@remix-run/node";
import {Form, useLoaderData} from "@remix-run/react";
import {prisma} from "~/db.server";
import {format} from "date-fns"

export async function loader({params}: LoaderArgs) {
  let entry = await prisma.entry.findUnique({
    where: {id: params.id},
    include: {categories: {include: {category: true}}},
  })
  if (!entry)
    throw new Response("Not found", {status: 404})

  let categories = await prisma.category.findMany({orderBy: {createdAt: "desc"}})

  return {entry, categories}
}

export async function action({request, params}: ActionArgs) {
  if (request.method === "DELETE") {
    await prisma.entry.delete({where: {id: params.id}})
    return redirect("/")
  }

  const formData = await request.formData();
  const value = parseInt(formData.get("value") as string)
  const description = formData.get("description") as string | null;
  const date = new Date(formData.get("date") as string);
  // "expense" or "income"
  const type = formData.get("type") as string;
  let categories = formData.getAll("category") as string[];

  await prisma.entry.update({
    where: {id: params.id},
    data: {
      value,
      description,
      date,
      type,
      categories: {
        create: categories.map(categoryId => ({categoryId})),
      }
    }
  })
  return new Response(null, {status: 303, headers: {Location: `/entries/${params.id}`}})
}

export default function EntryPage() {
  let data = useLoaderData<typeof loader>()

  return (
    <main>
      <article>
        <h1>Entry</h1>

        <section className="flex flex-col w-full my-4 space-y-4">
          <Form method="post" className="flex flex-col space-y-4 w-full">
            <label htmlFor="type">
              <span>Type</span>
              <select id="type" name="type" defaultValue={data.entry.type}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label htmlFor="value">
              <span>Value</span>
              <input type="number" name="value" id="value" defaultValue={data.entry.value} />
            </label>
            <label htmlFor="description">
              <span>Description</span>
              <input type="text" name="description" id="description" defaultValue={data.entry.description ?? ""} />
            </label>
            <label htmlFor="date">
              <span>Date</span>
              <input type="date" name="date" id="date" defaultValue={format(new Date(data.entry.date), "yyyy-MM-dd")} />
            </label>
            <label htmlFor="category">
              <span>Categories</span>
              <select id="category" name="category" multiple>
                {data.categories.map(category => (
                  <option key={category.id} value={category.id} selected={!!data.entry.categories.find(c => c.categoryId === category.id)}>{category.name}</option>
                ))}
              </select>
            </label>
            <div className="flex space-x-2 w-full">
              <button type="submit">Update</button>
            </div>
          </Form>
          <hr />
          <Form method="delete">
            <button className="bg-red-500 border border-red-700 px-4 py-1 rounded-md text-white">Delete</button>
          </Form>
        </section>
      </article>
    </main>
  )
}
