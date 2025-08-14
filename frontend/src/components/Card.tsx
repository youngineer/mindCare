import React from 'react'

const Card = () => {
  const name = "Test";
  const photoUrl = "https://i.pinimg.com/736x/6c/54/51/6c5451530fe844a5b99a1d4571d7b330.jpg";
  const isPatient = false;
  const rating = 5.0;
  const ratePerSession = 500;
  return (
    <div>
        <div className="card card-side bg-base-100 shadow-sm">
            <figure>
                <img
                src={photoUrl}
                alt="Movie" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{name}</h2>
                {
                  !isPatient && (
                  <div>
                    <p>Ratings: {rating}</p>
                    <p>Rate per session: {ratePerSession}</p>
                  </div>
                )
                }
                <div className="card-actions justify-end">
                <button className="btn btn-primary">View</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Card