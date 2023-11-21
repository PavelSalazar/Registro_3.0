/** Importando modulo para Conectar con SQL Server */
const sql = require('mssql');
/**Valores de LOGIN para conectar con base de datos de datos 
* Tipos de usuarios predefinidos para loguear a la base de datos */
let users = {
    admin:{user:'admin',password:'adminpassword'},
    public:{user:'asd',password:'asd'}
};

var user = 'asd';//
let pass = '1234';//
var host = 'localhost';
var db = 'Registro2';
var por = 1434;

var sqlConfig = {
    server:'localhost',
    authentication: {
        type: "default",
        options: {//configuracion de credencial
          userName: user,
          password: pass
        }
      },
      options: {//configuracion de acceso a la base
        port: por,
        database: db,
        trustServerCertificate: true
      }
};

class Database {
    constructor(config) {
        /**atributo para guardar configuracion */
        this.config = null;
        this.defaultConfig = null;
        /**config to SQL Server por defecto*/
        if(config== null){
            /**config to SQL Server por defecto*/
            this.config = sqlConfig;
            //this.defaultConfig = sqlConfig;
        }else{
            //parametro recibido en el constructor por defecto
            this.config = config;
        }
        
        /**pool es una conexion con la base de datos (SQL Server)
         * Crea pool de conexiones, y la guarda la conexion como atributo de la clase.*/
        this.pool = new sql.ConnectionPool(this.config);
        
        /**para guardar el resultado del ultimo query que se haga */
        this.lastResultQuery;
        
        console.warn(
            `= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
            Database data to Conecth with server:
            \nserver:${this.config.server};\nuser:${this.config.authentication.options.userName};\noptions:${JSON.stringify(this.config.options)} 
            \n= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =`
        );
    }
    //
    setDefaultConfigToLogin(userLogin,passwordLogin){
        this.config = sqlConfig;
        if (this.defaultConfig){
            this.pool = new sql.ConnectionPool(this.config);
            return true;
        }
        return false;
    }
    
    //query();
    async setConfigToLogin(userLogin,passwordLogin){
        try {
            console.warn('parametros recibidos en login() ======== ', userLogin,passwordLogin);
            
            var originalConfig = this.config;
            
            //para modificar los vales
            var configTemp = sqlConfig;

            //modificando los valores que se van usar para la conexion Temporal
            console.log(`============\nConfiguracion Original: \n${JSON.stringify(originalConfig)}\n========`);
            
            console.log(`configTemp['authentication']['options']['userName']======${
                JSON.stringify(
                    configTemp['authentication']['options']['userName']
                )
            }`);
            configTemp['authentication']['options']['userName'] = userLogin;//'ALKJASLKJLFKDJLKDSLKDSFJLJDSLKDFJSL';
            configTemp['authentication']['options']['password'] = passwordLogin;
            
            console.log(`\n============\nConfiguracion TEMPORAL: \n${JSON.stringify(configTemp)}\n\n========`);
            
            /**Conexion temporal para testear el acceso como administrador */
            this.pool = new sql.ConnectionPool(configTemp);
            /** si logro conectar entonces guarda esa conexion */
            console.log('poolTEMP:',this.pool);

            if (this.pool){
                console.log(`
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                ::::::::::::::::::::::::::::::::::::::::::::::::
                :::💀💀☠ENTRANDO AL SISTEMA como ADMIN☠💀💀:::
                    :::☠☠☠ USER == ${userLogin} ☠☠☠:::
                ::::::::::::::::::::::::::::::::::::::::::::::::
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                `);
                return true;
            }

            //solicitud de peticion
            //const poolRequest = await this.pool.request();
            /**manda un query */
            //this.lastResultQuery = await poolRequest.query(query);
            /**Retorna solo el resultado de la ultima query */

            return false;//this.lastResultQuery.recordset;//mandando solo el resultado
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async login(userLogin,passwordLogin){
        try {
            console.warn('parametros recibidos en login()::::::::: ', userLogin,passwordLogin);
            var originalConfig = this.config;
            
            //para modificar los vales
            var configTemp = originalConfig;

            //modificando los valores de credenciales para la conexion
            this.config.authentication.options.userName = userLogin;
            this.config.sqlConfig.authentication.options.password = passwordLogin;
            


            //sqlConfig.authentication.options //credenciales
            //sqlConfig.options //configBase

            console.log(`this.config: ${this.config}`);
            /**cierra la conexion */
            //await this.close();
            
            /**Conexion temporal para testear el acceso como administrador */
            let poolTemp = new sql.ConnectionPool(this.config);
            /** si logro conectar entonces guarda esa conexion */
            console.log('poolTEMP:',poolTemp);

            if(poolTemp){
                this.pool = poolTemp;
                this.accessAdmin = true;
                
                
                //this.config = originalConfig;
                return `Accediste como Adminador`;
            }
            console.log(`parametro optinons no se recibio o estalo, en db`);
            //vuelve a conectar con los valores por defecto
            //await this.connect();

            this.config = originalConfig;
            //this.connect();
            return `Problemas al Acceder Como Administrador\n Volviendo a Acceder como LECTOR`;

        } catch (error) {
            this.connect();
            return `Problemas al Acceder Como Administrador\n Volviendo a Acceder como LECTOR`;
            throw error;
        }
    }

    async connect() {
        try {
            await this.pool.connect();
            console.warn('::: Connected to the database :::');
        } catch (error) {
            throw error;
        }
    }
    async connectUser() {
        try {
            console.warn('Connected to the database');
            return await this.pool.connect();
        } catch (error) {
            throw error;
        }
    }


    /**haciendo una consulta, y guardandola en la variable result para retornarl el resultado de esa consulta */
    async query(query) {
        try {
            console.log('- - - -  query recibida en bd.query(query) :::::::: ',query);
            const poolRequest = await this.pool.request();
            /**manda un query */
            this.lastResultQuery = await poolRequest.query(query);
            /**Retorna solo el resultado de la ultima query */
            console.log('RESPUESTA query :::::::: ',query);
            return this.lastResultQuery.recordset;//mandando solo el resultado
        } catch (error) {
            throw error;
        }
    }

    async close() {
        try {
            await this.pool.close();
            console.warn('::: Disconnected from the database :::');
        } catch (error) {
            throw error;
        }
    }

    /**la conexion creada es con la informaicon recibida del json options. */
    async login(options = {userName: user,password: pass}){
        this.config.options = options;
        this.pool = new sql.ConnectionPool(this.config);
    }

}

module.exports = new Database(sqlConfig);//exportando la instancia. configurada para sqlServer
//al momento de importarla en index, hace una coneccion. // no solo la clase

