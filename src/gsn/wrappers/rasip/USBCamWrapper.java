package gsn.wrappers.rasip;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.Serializable;

import javax.imageio.ImageIO;

import net.coobird.thumbnailator.Thumbnails;

import org.apache.log4j.Logger;
import org.bytedeco.javacpp.opencv_core.IplImage;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.FrameGrabber;
import org.bytedeco.javacv.Java2DFrameConverter;
import org.bytedeco.javacv.OpenCVFrameConverter;
import org.bytedeco.javacv.OpenCVFrameConverter.ToIplImage;

import sun.awt.image.ToolkitImage;
import gsn.beans.AddressBean;
import gsn.beans.DataField;
import gsn.beans.DataTypes;
import gsn.beans.StreamElement;
import gsn.utils.ParamParser;
import gsn.wrappers.AbstractWrapper;

public class USBCamWrapper extends AbstractWrapper {
	
	private final transient Logger logger = Logger.getLogger(USBCamWrapper.class);
	private static int threadCounter = 0;
    
    private transient DataField[] outputStructure = new DataField[]{new DataField("picture", "binary", "USB camera picture.")};
    
	private static final String WRAPPER_NAME = "USBCamWrapper";
    private static final int DEFAULT_SAMPLING_RATE = 1;
    private static final int DEFAULT_WIDTH = 640;
    private static final int DEFAULT_HEIGHT = 480;
    private static final int DEFAULT_DEVICE_ID = 0;
    private static final int DEFAULT_RATE = 60000;
    
    private int samplingRate = DEFAULT_SAMPLING_RATE;
    private int rate = DEFAULT_RATE;
    private int width = DEFAULT_WIDTH;
    private int height = DEFAULT_HEIGHT;
    private int deviceId = DEFAULT_DEVICE_ID;
    
    private ToIplImage converter = new ToIplImage();
    private Java2DFrameConverter paintConverter = new Java2DFrameConverter();
    
  
   
    @Override
    public void run() {
        while (isActive()) {
        	FrameGrabber imageGrabber = null;
            try {
                Thread.sleep(rate);
                
                imageGrabber = FrameGrabber.createDefault(deviceId);
                //imageGrabber.start();
                
                boolean done = false;

                final int MAX_ATTEMPTS = 160;
                int attempt = 0;
                
                while (!done) {
                	attempt += 1;
                    try {
                    	imageGrabber.start();
                    	done = true;
                    } 
                    catch (Exception e) {
                    	if (attempt == MAX_ATTEMPTS) {
                    		done=true;
                    		logger.error("Camera initialisation aborted. Max attempts reached");
                    	}
                    }
                }
                      
                Frame img = imageGrabber.grab();   
                
                BufferedImage image = resizeImage(paintConverter.getBufferedImage(img, 1));
                
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(image, "JPEG", baos);
                baos.flush();
                byte[] imageInByte = baos.toByteArray();
                baos.close();

                StreamElement streamElement = new StreamElement(new String[]{ "picture"}, 
                		new Byte[]{DataTypes.BINARY}, 
                		new Serializable[]{imageInByte}, 
                		System.currentTimeMillis());

                postStreamElement(streamElement);
            } catch (InterruptedException e) {
               logger.error(e.getMessage(), e);
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            } finally {
            	try{
            		if(imageGrabber != null)
            		imageGrabber.stop();
            	} catch (Exception e)
            	{
            		logger.error(e.getMessage(), e);
            	}
            	
            }
        }
    }
    
    @Override
    public DataField[] getOutputFormat() {
         return outputStructure;
    }

    @Override
    public boolean initialize() {
        try {
        	
            setName(WRAPPER_NAME + (++threadCounter));
            
            AddressBean addressBean = getActiveAddressBean();
            if (addressBean.getPredicateValue("sampling-rate") != null) {
                samplingRate = ParamParser.getInteger(addressBean.getPredicateValue("sampling-rate"), DEFAULT_SAMPLING_RATE);
                if (samplingRate <= 0) {
                    samplingRate = DEFAULT_SAMPLING_RATE;
                }
            }
            
            if(addressBean.getPredicateValue("image-width") != null){
                width = ParamParser.getInteger(addressBean.getPredicateValue("image-width"), DEFAULT_WIDTH);
                if (width <= 0) {
                    width = DEFAULT_WIDTH;
                }
            }
            
            if(addressBean.getPredicateValue("image-height") != null){
                height = ParamParser.getInteger(addressBean.getPredicateValue("image-height"), DEFAULT_HEIGHT);
                if (height <= 0) {
                    height = DEFAULT_HEIGHT;
                }
            }
            
            if(addressBean.getPredicateValue("device-id") != null){
                deviceId = ParamParser.getInteger(addressBean.getPredicateValue("device-id"), DEFAULT_DEVICE_ID);
                if (deviceId <= 0) {
                    deviceId = DEFAULT_DEVICE_ID;
                }
            }
            
            return true;
        } catch (Exception ex) {
            logger.error(ex);
        }
        return false;
    }

    @Override
    public void dispose() {
        threadCounter--;
    }

    @Override
    public String getWrapperName() {
        return WRAPPER_NAME;
    }
    
    private BufferedImage resizeImage(BufferedImage image) throws IOException{
        return Thumbnails.of(image).size(this.width, this.height).asBufferedImage();
    }

}
