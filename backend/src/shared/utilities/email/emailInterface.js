export const emailInterface = async (userName, otp)=>{
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #2763AA; /* Dark purple color */
        }
        .content {
            line-height: 1;
            color: #333333;
        }
        .otp {
            display: inline-block;
            margin: 20px 0;
            padding: 9px 20px;
            letter-spacing:3px;
            background-color: #3E8CE9; /* Orange color */
            border-radius: 5px;
            font-size: 24px;
            color: white;
            font-weight: bold;
        }

    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>TRS - One Time Password</h1>
        </div>
        <div class="content">
            <p><em>Dear ${userName},</em></p>
            <p>Here is your One Time Password (OTP) for Travel Rate Scraping.</p>
            <div class="otp">${otp}</div>
            <p>This is valid for 5 minutes only.</p>
            
        </div>
    </div>
</body>
</html>
`
return content;
}