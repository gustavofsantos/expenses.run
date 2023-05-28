import {ActionArgs, redirect} from "@remix-run/node";
import {Form} from "@remix-run/react";
import {prisma} from "~/db.server";

function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, "-");
}

export async function action({request}: ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;

  await prisma.category.create({
    data: {
      id: slugify(name),
      name,
    }
  })

  return redirect("/")
}

export default function NewCategory() {
  return (
    <main>
      <h1>New category</h1>

      <Form method="post">
        <label htmlFor="name">
          <span>Name</span>
          <input type="text" name="name" id="name" />
        </label>
        <button type="submit">Save</button>
      </Form>
    </main>
  )
}
