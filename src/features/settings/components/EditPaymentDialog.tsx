import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/shared/FormDialog";
import { paymentConfigSchema, PaymentConfigFormValues } from "../types";

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PaymentConfigFormValues) => Promise<void>;
  isSubmitting: boolean;
  defaultValues: PaymentConfigFormValues;
}

export function EditPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultValues,
}: EditPaymentDialogProps) {
  const form = useForm<PaymentConfigFormValues>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onFormSubmit = async (data: PaymentConfigFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <FormDialog
      title="Payment Gateway"
      description="Configure your Razorpay credentials for payment processing."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Save Credentials"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="razorpay_key_id"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Razorpay Key ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="rzp_live_xxxxxxxxx" className="font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="razorpay_key_secret"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Razorpay Key Secret</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="••••••••••••••••" className="font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormDialog>
  );
}
