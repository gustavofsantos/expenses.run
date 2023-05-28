import {ActionArgs, redirect} from "@remix-run/node";
import {Form, useLoaderData} from "@remix-run/react";
import {prisma} from "~/db.server";

export async function action({request}: ActionArgs) {
  const formData = await request.formData();
  const value = parseInt(formData.get("value") as string)
  const description = formData.get("description") as string | null;
  const date = new Date(formData.get("date") as string);
  // "expense" or "income"
  const type = formData.get("type") as string;
  let categories = formData.getAll("category") as string[];

  console.log({value, description, date, type, categories})

  await prisma.entry.create({
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

  return redirect("/")
}

export async function loader() {
  let categories = await prisma.category.findMany({orderBy: {createdAt: "desc"}})

  return {categories}
}

export default function NewExpense() {
  let data = useLoaderData<typeof loader>()

  return (
    <main className="flex flex-col justify-start items-center">
      <article className="w-full px-2 lg:max-w-lg lg:px-0">
        <h1>New expense</h1>

        <section className="w-full">
          <Form method="post" className="flex flex-col space-y-4 w-full">
            <label htmlFor="type">
              <span>Type</span>
              <select id="type" name="type" defaultValue="expense">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label htmlFor="value">
              <span>Value</span>
              <input type="number" name="value" id="value" />
            </label>
            <label htmlFor="description">
              <span>Description</span>
              <input type="text" name="description" id="description" />
            </label>
            <label htmlFor="date">
              <span>Date</span>
              <input type="date" name="date" id="date" />
            </label>
            <label htmlFor="category">
              <span>Categories</span>
              <select id="category" name="category" multiple>
                {data.categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <div className="flex space-x-2 w-full">
              <button type="submit">Save</button>
              <button type="reset">Clear</button>
            </div>
          </Form>
        </section>
      </article>
    </main>
  )
}
