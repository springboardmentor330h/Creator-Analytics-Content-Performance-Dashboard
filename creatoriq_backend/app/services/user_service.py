# from app.schemas.user_schema import User

# users = []

# def add_user(user):

#     for existing_user in users:
#         if existing_user.id == user.id:
#             return {
#                 "message": "User ID already exists"
#             }

#     users.append(user)

#     return {
#         "message": "User created successfully",
#         "user": user
#     }

# def get_all_users():
#     return users

# def get_user_by_id(user_id: int):
#     for user in users:
#         if user.id == user_id:
#             return user

#     return {
#         "message": "User not found"
#     }

# def update_existing_user(user_id: int, updated_user: User):

#     for index, user in enumerate(users):

#         if user.id == user_id:
#             users[index] = updated_user

#             return {
#                 "message": "User updated successfully",
#                 "user": updated_user
#             }

#     return {
#         "message": "User not found"
#     }

# def delete_existing_user(user_id: int):

#     for user in users:

#         if user.id == user_id:
#             users.remove(user)

#             return {
#                 "message": "User deleted successfully"
#             }

#     return {
#         "message": "User not found"
#     }