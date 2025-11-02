const connect = async () => {

};

const runScript = async () => {
    try
    {
        await connect();
        const newUser = await User.create({
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123'
        });
        console.log('User created:', newUser);
        
    }catch(err)
    {
        console.error('Error running script:', err);
    }
}