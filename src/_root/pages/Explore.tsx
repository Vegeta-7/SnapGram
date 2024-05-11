import GridPostList from "@/components/Shared/GridPostList";
import Loader from "@/components/Shared/Loader";
import SearchResults from "@/components/Shared/SearchResults";
import { Input } from "@/components/ui/input"
import useDebounce from "@/hooks/useDebounce";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queriesAndMutations";
import { useState,useEffect } from "react"
import { useInView } from "react-intersection-observer"

const Explore = () => {
  const { ref, inView } = useInView()
  const {data:posts, fetchNextPage, hasNextPage } = useGetPosts();
  
  const [searchValue, setsearchValue] = useState('')
  const debouncedValue = useDebounce(searchValue,500);  //500ms
  const {data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedValue)

  useEffect(()=>{     //infinite scroll
    if(inView && !searchValue) fetchNextPage();
  },[inView,searchValue])

  if(!posts){
    return(
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    )
  }

  const shouldShowSearchResults = searchValue !== '';
  const shouldShowPosts = !shouldShowSearchResults && posts.pages.every((item) => item?.documents.length===0)

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            alt="search" 
            width={24}
            height={24}
          />
          <Input 
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={(e)=>setsearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Today</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="text-sm font-medium md:text-base text-light-2">All</p>
          <img
            src="assets/icons/filter.svg"
            alt="filter"
            width={20}
            height={20}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults 
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ?(
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : posts.pages.map((item, index) => (
          <GridPostList key={`page-${index}`} posts={item.documents}/>
        ))}
      </div>

      {hasNextPage && !searchValue && (
        // To do this we use react-intersection-observer package (InView)
        <div ref={ref} className="mt-10">   {/* ref is to check if this ref gets view we are in bottom of the page and want to start loading the new posts*/}
          <Loader />
        </div>
      )}
    </div>
  )
}

export default Explore