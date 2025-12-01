# Windows Server Deployment Guide - Questioner App

This guide provides step-by-step instructions for deploying the Questioner App on Windows Server.

## Prerequisites

### System Requirements
- Windows Server 2016 or later (or Windows 10/11 for development)
- At least 2GB RAM
- 1GB free disk space
- Internet connection for initial setup

### Required Software
1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - During installation, ensure "Add to PATH" is checked

2. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Deployment Methods

### Method 1: Simple Deployment (Recommended for Development)

1. **Copy Application Files**
   - Copy the entire application folder to your Windows server
   - Recommended location: `C:\inetpub\questioner-app\`

2. **Run Deployment Script**
   ```batch
   # Open Command Prompt as Administrator
   cd C:\inetpub\questioner-app
   deploy-windows.bat
   ```

3. **Start the Application**
   ```batch
   start-server.bat
   ```

4. **Access the Application**
   - Open browser and navigate to: http://localhost:3000

### Method 2: Windows Service Deployment (Recommended for Production)

1. **Complete Simple Deployment First**
   - Follow Method 1 steps 1-2

2. **Install as Windows Service**
   ```batch
   # Open Command Prompt as Administrator
   cd C:\inetpub\questioner-app
   install-windows-service.bat
   ```

3. **Verify Service Installation**
   - Open Services.msc
   - Look for "Questioner App" service
   - Service should be running automatically

4. **Access the Application**
   - Open browser and navigate to: http://localhost:3000

## Configuration Options

### Port Configuration
To change the default port (3000), you have several options:

#### Option 1: Environment Variable
```batch
set PORT=8080
start-server.bat
```

#### Option 2: Modify server.js
Edit `backend/server.js` and change:
```javascript
const PORT = process.env.PORT || 3000;
```
to:
```javascript
const PORT = process.env.PORT || 8080;
```

### Database Configuration
The application uses SQLite database located at `database/questioner.db`. No additional configuration required.

## Firewall Configuration

### Windows Firewall
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Create new Inbound Rule:
   - Rule Type: Port
   - Protocol: TCP
   - Port: 3000 (or your custom port)
   - Action: Allow the connection
   - Profile: All profiles
   - Name: "Questioner App"

### Network Access
To allow external access to the application:

1. **Modify server.js** (if needed):
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
       console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```

2. **Configure Router/Network**:
   - Forward port 3000 to the server's internal IP
   - Ensure network security policies allow the connection

## IIS Integration (Optional)

### Using IIS as Reverse Proxy

1. **Install IIS and URL Rewrite Module**
   - Enable IIS through Windows Features
   - Download and install URL Rewrite Module from Microsoft

2. **Create IIS Site**
   - Create new site in IIS Manager
   - Point to application's frontend folder
   - Set binding to desired port (e.g., 80)

3. **Configure URL Rewrite**
   Create `web.config` in frontend folder:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="API Proxy" stopProcessing="true">
             <match url="^api/(.*)" />
             <action type="Rewrite" url="http://localhost:3000/api/{R:1}" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

## Monitoring and Maintenance

### Service Management
```batch
# Check service status
sc query "Questioner App"

# Start service
sc start "Questioner App"

# Stop service
sc stop "Questioner App"

# Restart service
sc stop "Questioner App" && sc start "Questioner App"
```

### Log Files
- Service logs: Check Windows Event Viewer
- Application logs: `backend/logs/` (if configured)

### Database Backup
```batch
# Create backup
copy "database\questioner.db" "database\backup\questioner_backup_%date%.db"

# Restore backup
copy "database\backup\questioner_backup_YYYY-MM-DD.db" "database\questioner.db"
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change port or kill existing process:
```batch
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

#### Node.js Not Found
```
'node' is not recognized as an internal or external command
```
**Solution**: 
- Reinstall Node.js with "Add to PATH" option
- Or manually add Node.js to system PATH

#### Database Permission Issues
**Solution**: Ensure the application has read/write access to the database folder:
```batch
icacls "database" /grant "Everyone":(OI)(CI)F
```

#### Service Won't Start
**Solution**: 
1. Check Windows Event Viewer for detailed error messages
2. Verify all dependencies are installed
3. Ensure database file exists and is accessible

### Performance Optimization

#### For Production Deployment:
1. **Set NODE_ENV to production**:
   ```batch
   set NODE_ENV=production
   ```

2. **Increase Node.js memory limit** (if needed):
   ```batch
   node --max-old-space-size=4096 server.js
   ```

3. **Enable compression** in server.js:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

## Security Considerations

### Basic Security Measures:
1. **Change default port** from 3000 to a non-standard port
2. **Enable HTTPS** using SSL certificates
3. **Implement authentication** if required
4. **Regular updates** of Node.js and dependencies
5. **Firewall configuration** to restrict access
6. **Regular database backups**

### SSL/HTTPS Configuration:
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
```

## Updating the Application

### Manual Update:
1. Stop the service: `sc stop "Questioner App"`
2. Backup database: `copy database\questioner.db database\backup\`
3. Replace application files
4. Start the service: `sc start "Questioner App"`

### Automated Update Script:
Create `update-app.bat`:
```batch
@echo off
echo Stopping service...
sc stop "Questioner App"

echo Creating backup...
copy "database\questioner.db" "database\backup\questioner_backup_%date%.db"

echo Updating dependencies...
cd backend
npm install

echo Starting service...
sc start "Questioner App"

echo Update completed!
pause
```

## Support and Maintenance

### Regular Maintenance Tasks:
- **Weekly**: Check service status and logs
- **Monthly**: Update Node.js dependencies (`npm update`)
- **Quarterly**: Backup database and application files
- **Annually**: Update Node.js version

### Getting Help:
- Check Windows Event Viewer for detailed error messages
- Review application logs
- Verify all prerequisites are met
- Test with simple deployment before using service deployment

---

**For additional support, please refer to the main README.md file or contact the development team.**
