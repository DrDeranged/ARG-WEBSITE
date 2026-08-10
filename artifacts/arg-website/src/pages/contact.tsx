import { Shell } from '@/components/layout/Shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  company: z.string().min(2, 'Company is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message is required (min 10 characters).'),
});

export default function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Submit inquiry to backend
  }

  return (
    <Shell>
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 bg-paper border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <h1 className="text-5xl md:text-7xl font-serif text-ink mb-16 md:mb-24">Let's Talk.</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Contact Details */}
            <div className="lg:col-span-5 flex flex-col gap-12">
              <div>
                <h3 className="font-mono text-slate tracking-widest text-xs font-semibold mb-6 uppercase">
                  Contact Information
                </h3>
                <div className="font-mono text-base space-y-6 text-ink tabular-nums border-l border-recovered pl-6 py-2">
                  <p className="flex flex-col">
                    <span className="text-slate text-xs mb-1">Phone</span>
                    (877) 464-8470
                  </p>
                  <p className="flex flex-col">
                    <span className="text-slate text-xs mb-1">Fax</span>
                    (888) 881-8211
                  </p>
                  <p className="flex flex-col">
                    <span className="text-slate text-xs mb-1">Email</span>
                    collect@advancedrecoverygroup.com
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-mono text-slate tracking-widest text-xs font-semibold mb-6 uppercase">
                  Business Hours
                </h3>
                <div className="font-mono text-base space-y-2 text-ink">
                  <p className="flex justify-between max-w-xs">
                    <span>Monday - Thursday</span>
                    <span>9AM - 5PM</span>
                  </p>
                  <p className="flex justify-between max-w-xs">
                    <span>Friday</span>
                    <span>9AM - 2PM</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate">Full Name</FormLabel>
                          <FormControl>
                            <Input className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate">Company</FormLabel>
                          <FormControl>
                            <Input className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate">Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-slate">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={5} 
                            className="rounded-sm border-rule bg-paper focus-visible:ring-recovered font-sans resize-y min-h-[120px]" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="bg-ink text-paper hover:bg-ink/90 rounded-sm px-10 py-6 h-auto text-sm font-medium w-full md:w-auto">
                    Submit Inquiry
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-12 border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="w-full aspect-[21/9] bg-paper overflow-hidden rounded-sm relative">
             <img src="/images/office.jpg" alt="ARG Office" className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80" />
             <div className="absolute inset-0 border border-rule/50 rounded-sm pointer-events-none"></div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
