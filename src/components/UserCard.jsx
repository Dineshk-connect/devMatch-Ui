
const userCard = ({user}) => {
  const {firstName, lastName, about, age, gender,photoUrl, skills} = user;
  console.log("User Data:", user);
  return (
   <div className="card grid-rows-1 bg-base-300 w-96 shadow-xl p-3">
  <figure>
    <img
      src={user.photoUrl}
      alt="photo" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">{firstName + " " + lastName  }</h2>
    {age && gender && <p>{age + ", " + gender}</p>}
    <p>{about}</p>
    <div className="card-actions justify-center my-4">
      <button className="btn btn-primary">Ignore</button>
       <button className="btn btn-secondary">Interested</button>
    </div>
  </div>
</div>
  );
};

export default userCard