## Guidance (before public release)

### Prerequisite
* Word (browser version)
* Nodejs >= v20.x.xx

```shell
npm install -g pnpm
```


### Run in local
under `./office-addin`
```shell

pnpm install

npm run start:dev # Load Addin in local office from dev env
# or
npm run start:prod # Load Addin in local office from prod env
```


### Manual Installation on Web Office

1. Download https://mai-mind-map.azurewebsites.net/addin/manifest.xml or https://dev-mai-mind-map.azurewebsites.net/addin/manifest-dev.xml

   ![image](https://github.com/user-attachments/assets/c8fa6598-3c08-4f10-a44e-aeb6561de0c7)
2. In **My Add-ins** -> **Manage My Add-ins**, click **Upload My Add-in**

   ![image](https://github.com/user-attachments/assets/4d580d87-77b5-4675-91b0-0cdf2e2e3b57)
3. Upload downloaded `manifest.xml` in step 1.

   ![image](https://github.com/user-attachments/assets/047312d6-c9a5-43cd-a0c2-0913bf615dc4)
4. If successfully installed, there should be an action button on top right of toolbar. Click to open the add-in task panel.

   ![image](https://github.com/user-attachments/assets/fb36bf6e-85bd-43d2-8a0f-e937db49c0f3)

