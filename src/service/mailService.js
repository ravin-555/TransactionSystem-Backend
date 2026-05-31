import nodemailer from 'nodemailer'
import { User } from '../models/User.js'
import AppError from '../utils/AppError.js';


async function getAccount_no(mail) {
    const user= await User.findOne({email:mail})
    const account=user.accountNumber
    console.log("account: "+account)
    return account;

}

export const MailService =async(mail_add,password)=>{
    //  create a SMTP transporter
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'ravinghimire490@gmail.com',
            pass:process.env.MAIL_PASS
        }
    })
    // verify that Nodemailer can connect to your SMTP server. 
    await transporter.verify();
    console.log("Server is ready to take our messages");

    //mail options if verified
    const accountNumber = await getAccount_no(mail_add);
    var mailOptions={
        from:'ravinghimire490@gmail.com',
        to:mail_add,
        subject:"Welcome To Fintech",

        html:`<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <!-- Main Container (600px max) -->
                    <table class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px;">
                        <!-- Header -->
                        <tr><td style="padding: 40px; text-align: center; background-color: #007bff; color: #ffffff;"><h1>FinTech</h1></td></tr>
                        <!-- Content -->
                        <tr><td style="padding: 40px; color: #333333; line-height: 1.6;">
                          <h4>Hey,there</h4>
                          <div>
                            <p>thank u for joining Us , Your account information is Below :</p>
                            <div style="display: flex ; flex-direction: column; gap:1rem;">
                              <div>
                              <h4 style="font-weight: bold;">AccountNumber : </h4> <span>${accountNumber}</span>
                              </div>
                              <div>
                              <h4>Password : </h4> <span>${password}</span>
                              </div>

                            </div>

                          </div>
                        </td></tr>
                        <!-- Footer -->
                        <tr><td style="padding: 30px; text-align: center; color: #888888;">©️FinTech | All Rights Reserved</td></tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>`
        
        
        
        
        
    }
    
    //  send mail
    transporter.sendMail(mailOptions,(error,info)=>{
        console.log("Message sent:", info?.messageId);
        return ({ message: "Sucessfully sent " + info?.response })
        if (error) {
            console.log("Error in sending :", error)
            switch (error.code) {
                case "ECONNECTION":
                case "ETIMEDOUT":
                    console.error("Network error - retry later:", err.message); 
                    break;
                case "EAUTH":
                    console.error("Authentication failed:", err.message);
                    break;
                case "EENVELOPE":
                    console.error("Invalid recipients:", err.rejected);
                    break;
                default:
                    console.error("Send failed:", err.message);
            }
            throw new AppError(500, "Failed to send email", "EMAIL_SEND_FAILED", { details: error.message });
        }


    })


}