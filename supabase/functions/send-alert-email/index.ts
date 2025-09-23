import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  to: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  parameter_type: string;
  parameter_value: number;
  threshold_value: number;
  batch_id: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '#dc2626'; // red-600
    case 'high':
      return '#ea580c'; // orange-600
    case 'medium':
      return '#ca8a04'; // yellow-600
    case 'low':
      return '#2563eb'; // blue-600
    default:
      return '#6b7280'; // gray-500
  }
};

const getSeverityLabel = (severity: string) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alertData: AlertEmailRequest = await req.json();
    console.log('Sending alert email:', alertData);

    const severityColor = getSeverityColor(alertData.severity);
    const severityLabel = getSeverityLabel(alertData.severity);

    const emailResponse = await resend.emails.send({
      from: "Quality Monitor <alerts@resend.dev>",
      to: [alertData.to],
      subject: `🚨 ${severityLabel} Alert: ${alertData.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quality Monitor Alert</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 24px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Quality Monitoring System</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Critical Alert Notification</p>
            </div>

            <!-- Alert Badge -->
            <div style="padding: 24px 24px 0 24px;">
              <div style="display: inline-block; background-color: ${severityColor}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                ${severityLabel} SEVERITY
              </div>
            </div>

            <!-- Content -->
            <div style="padding: 24px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px;">${alertData.title}</h2>
              <p style="margin: 0 0 24px 0; color: #374151; line-height: 1.6;">${alertData.message}</p>

              <!-- Alert Details -->
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600;">Alert Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Batch ID:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600;">${alertData.batch_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Parameter:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600;">${alertData.parameter_type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Current Value:</td>
                    <td style="padding: 8px 0; color: ${severityColor}; font-weight: 600;">${alertData.parameter_value}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Threshold:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600;">${alertData.threshold_value}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Timestamp:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </div>

              <!-- Action Required -->
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">⚠️ IMMEDIATE ATTENTION REQUIRED</h4>
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  Please log into the Quality Monitoring System immediately to investigate and address this ${severityLabel.toLowerCase()} severity alert.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 24px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated alert from the Quality Monitoring System.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Alert email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-alert-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);