"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInputControl from "../helper/FormInputControl";
import { createContactSchema } from "@/validations/organizations";

export default function ContactForm() {
  const form = useForm<z.infer<typeof createContactSchema>>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  function onSubmit(values: z.infer<typeof createContactSchema>) {
    console.log(values);
  }
  return (
    <Form {...form}>
      <h2 className="text-2xl font-semibold">Create Contact</h2>

      <hr className="my-4" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormInputControl
            form={form}
            name="contactPerson.name"
            placeholder="Contact person name"
          />
          <FormInputControl
            form={form}
            name="contactPerson.email"
            placeholder="Contact person email"
          />
          <FormInputControl
            form={form}
            name="contactPerson.phone"
            placeholder="Contact person phone"
          />
          <FormInputControl
            form={form}
            name="contactPerson.address"
            placeholder="Contact person address"
          />
          <FormInputControl
            form={form}
            name="contactPerson.postalCode"
            placeholder="Contact person postal code"
          />
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
