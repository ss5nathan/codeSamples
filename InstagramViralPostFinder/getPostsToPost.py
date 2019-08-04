
#nathan sardo
#sample code
#this code will take in a list of hashtags and gets viral posts from those, adds those to a directory for easy access
#Uses InstagramApi from  https://github.com/LevPasha/Instagram-API-python, modifies a demo

from InstagramAPI import InstagramAPI
import json
import requests
from pprint import pprint
import urllib.request
import time



#helper function
def login():

    user = "USERNAME"
    password = "PASSWORD"

    api = InstagramAPI(user, password)
    api.login()
    print("loggin in api")
    print(api)
    user_id = api.username_id
    return api


#loops through tag pagination before hitting the max number
#main funcionality in the program
def getXTopPostsFromTag(numPosts,tag,api):
    try:
        has_more_posts = True
        max_id = ''
        postIds = []
        imageUrls = []
        maxNumber = numPosts
        print("before loop")
        hashTag = tag

        while has_more_posts:
            _ = api.getHashtagFeed(hashTag,max_id)

            #prints lots of json for debugging
            pprint(api.LastJson['ranked_items'])

            for c in api.LastJson['ranked_items']:
                postIds.append(c)

            has_more_posts = api.LastJson.get('more_available', False)

            # stop loop
            if len(postIds) >= maxNumber:
                
                has_more_posts = False
                print("stopped by count")

            #continue looping of hashtag has more pages
            if has_more_posts:
                max_id = api.LastJson.get('next_max_id', '')
                time.sleep(5)
        return postIds
    except Exception as e:
        print(e)
        print("ERROR")
        return []

#helper class, taken from github https://github.com/LevPasha/Instagram-API-python
class DownloadThread():
    def __init__(self, client, thread_id):
        self.client = client

        self.thread = thread_id
        self.newest_cursor = None
        self.oldest_cursor = None
        self.users = {}
        self.conversation = []

    def init_owner(self):
        if not self.client.getProfileData():
            print("Failed!\n")

        user = self.client.LastJson.get('user')
        self._add_user(user)

    def _request(self):
        return self.client.getv2Threads(thread_id, self.oldest_cursor)

    def _download(self):
        if self.oldest_cursor is not None:
            self._request()
            self._save()

    def _save(self):
        data = self.client.LastJson.get('thread')
        self.conversation = data['items'][::-1] + self.conversation
        self.oldest_cursor = data.get('oldest_cursor')
        self.newest_cursor = data.get('newest_cursor')
        self._download()

    def add_users(self, users):
        for user in users:
            self._add_user(user)

    def _add_user(self, user):
        self.users[user['pk']] = {'full_name': user['pk'], 'username': user['username']}

    def download(self):
        if not self._request():
            print("Failed!\n")

        data = self.client.LastJson.get('thread')
        self.add_users(data['users'])
        self._save()

    def save(self):
        dump = json.dumps(self.conversation)
        with open('back.txt', 'w') as f:
            f.write(dump)

#helper function taken from github https://github.com/LevPasha/Instagram-API-python
def runDLThread(apiObj,threadID):
    thread_id = threadID  # id thread for download
    inst = DownloadThread(apiObj, thread_id)
    inst.download()
    inst.save()

def main():
    minLikeCount = 600


    api = login()
    input("pausing")
    pprint(api.getProfileData())
    pprint(api.LastJson)
    pprint(api.getUsernameInfo(api.username_id))
    pprint(api.LastJson)

    #taglist
    tagList = ['naturelights','northernlights','showlights','snowshow',"alaskaphotography","outdoorphotography","naturepics","outdoorpics"]
    jsonList = []
    for tag in tagList:
        #do function for each hashtag
        ls = (getXTopPostsFromTag(25,tag,api))
        print("sleeping one min")
        time.sleep(60)
        if len(ls) > 0:
            jsonList.append(ls)

    #have X posts of each tag

    #dump for debugging
    with open("moreData.json","w") as f1:
        for tag in jsonList:
            for post in tag:
                json.dump(post,f1)
                f1.write('\n')

    #write to text file and write output images
    with open("listOfPosts.txt",'w') as f2:
        for tag in jsonList:
            for post in tag:
                print("______POST______")
                likeNum = post['like_count']
                #fix caption issue
                caption =  post['caption']
                if(caption is None):
                    continue
                caption = caption['text']
                #truncates caption
                caption = (caption[:200] + '..') if len(caption) > 200 else caption
                username =  post['user']['username']

                urls = []

                #gets image/video from post
                checkSinglePost = post.get('image_versions2',"")
                checkCarousel = post.get('carousel_media',"")
                checkSingleVideo = post.get('video_versions',"")

                
                if post.get('media_type',"") != "" and (int(post.get('media_type',"")) == 1 or int(post.get('media_type',"")) == 2):

                    if((not checkSinglePost == "") and checkSingleVideo == ""):
                        
                        for key in post["image_versions2"]["candidates"]:
                            url = key["url"]
                            urls.append(str(url))

                        try:
                            #prints out username of viral post and caption
                            print("USERNAME: " + str(username))
                            print("CAPTION: " + str(caption))
                        except:
                            pass
                            

                        if(int(likeNum) > minLikeCount and len(urls) > 0):
                            #
                            #download the file
                            urllib.request.urlretrieve(urls[0], './getPostsDir/photo_'+str(username)+'_'+str(likeNum)+'.png')  
                            #print("post has enough likes")
                            print('\n' + urls[0] + '\n' + str(likeNum) + '\n' + username + '\n--' )
                            f2.write('\n' + urls[0] + '\n' + '\n'+ caption+'\n' +str(likeNum) + '\n' + username + '\n--' )
                    
                    #different procedure if a carousel post
                    elif not checkCarousel == "":
                        
                        try:
                            print("USERNAME: " + str(username))
                            print("CAPTION: " + str(caption))
                        except:
                            pass

                        numCarousel = int(post['carousel_media_count'])
                        imageUrls = []
                        for i in range(numCarousel):
                            individual = posts['carousel_media'][i]
                            if int(individual['media_type']) == 1:
                                imageUrls.append(individual['image_versions2']['candidates'][0]['url'])
                            elif int(individual['media_type']) == 2:
                                #video

                                imageUrls.append(individual['video_versions'][0]['url'])
                                #video?
                        if(int(likeNum) > minLikeCount and len(urls) > 0):
                            #download the file
                            for url in imageUrls:
                                ending = '.jpg'
                                try:
                                    tmpEnding = url
                                    ind = url.index('?')
                                    tmpEnding = url[ind-8:ind]
                                    ind2 = tmpEnding.index('.')
                                    tmpEnding = tmpEnding[ind2:]
                                    ending = tmpEnding
                                except:
                                    pass

                            if(int(likeNum) > minLikeCount and len(urls) > 0):
                                urllib.request.urlretrieve(url, './getPostsDir/'+str(likeNum)+' photo_'+"x of " + str(numCarousel)+"_"+str(username)+'_'+ending)  
                                #print("post has enough likes")
                                print('\n' + url + '\n' + str(likeNum) + '\n' + username + '\n--' )
                                f2.write('\n' + url + '\n' + '\n'+ caption+'\n' +str(likeNum) + '\n' + username + '\n--' )


if __name__ == '__main__':
    
    main()
    



















