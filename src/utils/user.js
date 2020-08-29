const users = []

const addUser = ( {id, username, group} ) => {

    //optimize the data
    username = username.trim().toLowerCase()
    group = group.trim().toLowerCase()

    //run validation
    if(!username || !group) {
        return {
            error: 'Username and group are required!'
        }
    }

    //check for existing user IN THE SAME GROUP
    const existingUser = users.find((user) => {
        return user.group === group && user.username === username
    })
    if(existingUser){
        return {
            error: 'User already exists'
        }
    }
    //Add non exiting user
    const user = { id, username, group }
    users.push(user)
    
    return { user }
}

//Remove User by ID
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index !== -1){
        //return the removed user
        return users.splice(index, 1)[0]
    }
}

//Get User
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

//Get User in Group
const getUsersInGroup = (group) => {
    group = group.trim().toLowerCase()
    return users.filter((user) => user.group === group)

}

// addUser({
//     id: 22,
//     username: 'Sush',
//     group: 'Study'
// })
// addUser({
//     id: 23,
//     username: 'Bruce',
//     group: 'Study'
// })
// addUser({
//     id: 24,
//     username: 'Art',
//     group: 'Football'
// })

// //console.log(newUser)
// //console.log(users)

// const findUser = getUsersInGroup('Study')
// console.log(findUser)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInGroup
}