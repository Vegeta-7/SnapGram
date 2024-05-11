import Loader from "@/components/Shared/Loader";
import Usercard from "@/components/Shared/Usercard";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations"

const AllUsers = () => {
  const {data:creators, isLoading, isError}=useGetUsers();
  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {isLoading && !creators ?(
          <Loader />
        ):(
          <ul className="user-grid">
            {creators?.documents.map((creator) =>(
              <li key={creator.$id} className="flex-1 min-w-[200px] w-full">
                <Usercard user={creator}></Usercard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AllUsers